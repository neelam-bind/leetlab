import { db } from '../libs/db.js';
import { getJugde0LanguageId, pollBatchResults, submitBatch } from '../libs/judge0.lib.js';


export const createProblem = async (req, res) => {
    //get all the data from the request body
    const { title, description, difficulty, constraints, testCases, codeSnippets, examples, tags, referenceSolution } = req.body;
    
    //check users role again
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'You are not authorized to create a problem' });
    }
    
    if (!referenceSolution || typeof referenceSolution !== 'object') {
    console.error("Invalid referenceSolution:", referenceSolution);
    return res.status(400).json({ error: 'referenceSolution must be a valid object' });
}
    //loop through each and every solution
    try {
        for (const [language, solutionCode] of Object.entries(referenceSolution)) {
            console.log("referenceSolution")
            const languageId = getJugde0LanguageId(language);

            console.log("Language:", language);
            console.log("Language ID:", languageId);



            const submission = testCases.map(({ input, output }) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin: input,
                expected_output: output
            }))
            
            
            const submissionResults = await submitBatch(submission);

            const tokens = submissionResults.map((res) => res.token);
            const results = await pollBatchResults(tokens);

            for (let i = 0; i < results.length; i++) {
                const result = results[i];

                console.log("Result: \n", result);
                if (result.status.id !== 3) {
                    return res.status(400).json({ error: `Test case ${i + 1} failed for language ${language}` });
                }
            }
            
            console.log('till here')
            //save the data in the database
            const newProblem = await db.problem.create({
                data: {
                    title,
                    description,
                    difficulty,
                    constraints,
                    testCases,
                    codeSnippets,
                    examples,
                    tags,
                    referenceSolution,
                    userId: req.user.id
                }
            });
            return res.status(201).json({ message: 'Problem created successfully', problem: newProblem });
        }
    } catch (error) {
        return res.status(500).json({
            // error: 'Error while creating the problem'
            error: error.message });
    }
}

export const getAllProblems = async (req, res) => {
    try {
        const problems = await db.problem.findMany();
        if (!problems) {
            return res.status(404).json({
                error: 'No problems found'
            })
        }

        res.status(200).json({
            success: true,
            message: "Messages fetched successfully",
            problem: problems
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            error: 'While fetching problems an error occurred',
        });
    }
}

export const getProblemById = async (req, res) => {
    const { id } = req.params;
    try {
        const problem = await db.problem.findUnique(
            {
                where: {
                    id
                },
            }
        )
        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Problem fetched successfully',
            problem
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: 'Error while fetching the problem'
        })
    }
}

export const updateProblemById = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testCases,
      codeSnippets,
      referenceSolution,
    } = req.body;

    const problem = await db.problem.findUnique({ where: { id } });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    if (req.user.role !== 'ADMIN') {
      return res
        .status(403)
        .json({ error: 'Forbidden: Only admin can update problems' });
    }

    // Step 1: Validate each reference solution using testCases
    console.log("Reached here")
    console.log("Reference Solution:", referenceSolution);

    for (const [language, solutionCode] of Object.entries(referenceSolution)) {
        console.log("Reference Solution Code:", solutionCode);
        console.log("Reference Solution Language:", language);

      const languageId = getJugde0LanguageId(language);
      if (!languageId) {
        return res
          .status(400)
          .json({ error: `Unsupported language: ${language}` });
      }

      const submissions = testCases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      console.log('Submissions:', submissions);

      // Step 2.3: Submit all test cases in one batch
      const submissionResults = await submitBatch(submissions);

      // Step 2.4: Extract tokens from response
      const tokens = submissionResults.map((res) => res.token);

      const results = await pollBatchResults(tokens);

      // Step 2.6: Validate that each test case passed (status.id === 3)
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status.id !== 3) {
          return res.status(400).json({
            error: `Validation failed for ${language} on input: ${submissions[i].stdin}`,
            details: result,
          });
        }
      }
    }

    // Step 3. Update the problem in the database

    const updatedProblem = await db.problem.update({
      where: { id },
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testCases,
        codeSnippets,
        referenceSolution,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      problem: updatedProblem,
    });
  } catch (error) {
    console.error('Error creating problem:', error);
    res.status(500).json({ error: 'Failed to update problem' });
  }
};


export const deleteProblem = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(404).json({ error: 'Problem ID is required' });
    }

    //check if the user is admin
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'You are not authorized to delete a problem' });
    }

    try {
        await db.problem.delete({
            where: {
                id
            }
        });
        return res.status(200).json({ message: 'Problem deleted successfully' });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Error while deleting the problem' });
    }
}

export const getAllProblemsSolvedByUser = async (req, res) => {
    const { id } = req.user;
    try {
        const problems = await db.problem.findMany({
            where: {
                problemSolved: {
                    some: {
                        userId: req.user.id
                    }
                }
            },
            include:{
                problemSolved: {
                    where:{
                        userId: req.user.id
                    }
                }
            }
        });
        res.status(200).json({
        success: true,
        message: 'Problems fetched successfully',
        problems,
    });
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Failed to fetch problems' });
    }
}
