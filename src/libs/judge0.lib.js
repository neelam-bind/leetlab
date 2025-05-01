import axios from "axios";

export const getJugde0LanguageId = (language) => {
    const languageMap = {
        "PYTHON3": 34,
        "C": 50,
        "C++": 54,
        "JAVA": 62,
        "JAVASCRIPT": 63
    }
    return languageMap[language.toUpperCase()];
}

//hits the judge0 endpoint to submit the batch of submissions
export const submitBatch = async (submissions) => {

    const {data} = await axios.post(`${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`, {
        submissions
    })
    console.log("Batch submission response: ", data);
    return data;
}


const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const pollBatchResults = async (tokens) => {
    while(true){
        const {data} = await axios.get(`process.env.JUDGE0_API_URL}/submissions/batch`,{
            params: {
                tokens: tokens.join(','),
                base64_encoded: false,
            }
        });

        const results = data.submissions;
        const allDone = results.every(
            (r) => r.status.id >=3
        );
        if(allDone){
            return results;
        }
        await sleep(1000);
    }
};
