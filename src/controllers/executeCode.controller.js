import { pollBatchResults, submitBatch } from "../libs/judge0.lib.js";

export const executeCode = async (req, res) => {
    try {
        const { source_code, language_id, stdin, expected_outputs, problemId } = req.body;
          const { userId } = req.user.id;

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

        res.status(200).json({
            message: "Code executed successfully",
        });
        } catch (error) {
            console.error("Error executing code:", error.message);
            res.status(500).json({ error: "Failed to execute code" });
    }
};
