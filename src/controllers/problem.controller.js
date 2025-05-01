import {db} from  '../libs/db.js';
import { getJugde0LanguageId, pollBatchResults, submitBatch } from '../libs/judge0.lib.js';


export const createProblem = async (req, res) => {
    //get all the data from the request body
    const { title, description, difficulty, constraints, testcases , codeSnippets, examples, tags , referenceSolution } = req.body;
    
    //check users role again
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: 'You are not authorized to create a problem' });
    }
    //loop through each and every solution
    try {
        for(const [language , solutionCode ] of Object.entries(referenceSolution)){

            const languageId = getJugde0LanguageId(language);
            if (!languageId) {
                return res.status(400).json({ error: `Language ${language} is not supported` });
            }

            const submission = testcases().map(( {input ,output}) => ({
                source_code: solutionCode,
                language_id: languageId,
                stdin : input,
                expected_output: output
            }))

            const submissionResults = await submitBatch(submission);

            const tokens = submissionResults.map((res) =>res.token);
            const results = await pollBatchResults(tokens);


            for(let i=0;i<results.length;i++){
                const result = results[i];
                if(result.status.id !== 3){
                    return res.status(400).json({ error: `Test case ${i+1} failed for language ${language}` });
                }
            }
            //save the data in the database
            const newProblem = await db.problem.create({
                data :{
                    title,
                    description,
                    difficulty,
                    constraints,
                    testcases,
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
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export const getAllProblems = async (req, res) => {}

export const getProblemById = async (req, res) => {}

export const updateProblemById = async (req, res) => {}

export const deleteProblem = async (req, res) => {}

export const getAllProblemsSolvedByUser = async (req, res) => {}
