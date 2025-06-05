import { db } from "../libs/db.js";
import { getLanguageName ,pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const executeCode = async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;
          const  userId  = req.user.id;

        //validate the testCases
        if(
            !Array.isArray(stdin) ||
            stdin.length === 0 ||
            !Array.isArray(expected_outputs) ||
            expected_outputs.length !== stdin.length 
        ){
            return res.status(400).json({error: "Invalid or Missing test cases"});
        }
        //2. Prepare each testCase for submission

        const submissions = stdin.map((input) => ({
            source_code,
            language_id,
            stdin: input
        }))
        
        //3. Send batch of submission to judge0
        const submissionResponse = await submitBatch(submissions);
        const tokens = submissionResponse.map((submission) => submission.token);
        
        //4. poll judge0 for results of all the submitted test case 
        const results = await pollBatchResults(tokens);
        console.log("results--------------------");
        console.log(results);


        //5. Check if the results are correct or not
        let allPassed = true;

        const detailedResults = results.map((result, index) => {
            const stdout = result.stdout?.trim() || "";
            const expectedOutput = expected_outputs[index]?.trim() || "";
            const passed = stdout === expectedOutput;

            if(!passed) {
                allPassed = false;
            }

            return {
                testCase :index+1,
                passed,
                stdout,
                expected: expectedOutput,
                stderr:result.stderr|| null,
                compile_error :result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory} KB` : undefined,
                time: result.time ? `${result.time} sec` : undefined
            }
        });

        console.log("detailedResults--------------------");
        console.log(detailedResults);

        if (!userId || !problemId || !source_code) {
            throw new Error("Missing required fields");
        }

        const submission = await db.Submission.create({
            data:{
                userId,
                problemId,
                sourceCode:source_code,
                language:getLanguageName(language_id),
                stdin :stdin.join("\n"),
                stdout: JSON.stringify(detailedResults.map((r)=> r.stdout)),
                stderr: detailedResults.some((r)=> r.stderr) ? JSON.stringify(detailedResults.map((r)=> r.stderr)) : null,                
                compileOutput: detailedResults.some((r)=> r.compile_output) ? JSON.stringify(detailedResults.map((r)=> r.compile_output)) : null,
                status: allPassed ? "ACCEPTED" : "WRONG ANSWER",
            }
        });
        //if all passed =true , mark the problem as current user 
        if(allPassed){
            await db.problemSolved.upsert({
                where:{
                    userId_problemId:{
                        userId,
                        problemId,
                    }
                },
                update:{},
                create:{
                    userId,
                    problemId,
                }
            });
        }

        //8. save indivilual test case results to the database

        const testCaseResults = detailedResults.map((result) => ({
            submissionId: submission.id,
            testCase: result.testCase,
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compileOutput: result.compile_output,
            status: result.status,
            memory: result.memory,
            time: result.time,
        }));

        await db.testCaseResult.createMany({
            data: testCaseResults
        })

        const submissionWithTestCase = await db.Submission.findUnique({
            where: {
                id: submission.id,
            },
            include: {
                testCaseResult: true,
            },
            });

        res.status(200).json({
            success: true,
            message: "Code executed successfully",
            submission: submissionWithTestCase
        });
        } catch (error) {
            console.error("Error executing code:", error.message);
            res.status(500).json({ error: "Failed to execute code" });
        }
};

