import axios from "axios";

export const getJugde0LanguageId = (language) => {
    const languageMap = {
        "PYTHON": 71,
        "JAVASCRIPT": 63,
        "JAVA": 62,
        "CPP": 54,
        "GO": 60,
    }
    return languageMap[language.toUpperCase()];
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


//hits the judge0 endpoint to submit the batch of submissions
export async function submitBatch(submissions) {
  const { data } = await axios.post(
    `${process.env.JUDGE0_API_URL}/submissions/batch?base64_encoded=false`,
    { submissions }
  );
  return data;
}




export const pollBatchResults = async (tokens) => {
    while(true){
        const {data} = await axios.get(`${process.env.JUDGE0_API_URL}/submissions/batch`,{
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


export function getLanguageName(languageId) {
    const LANGUAGE_NAMES = {
      74: "TypeScript",
      63: "JavaScript",
      71: "Python",
      62: "Java",
      54: "C++",
      60: "Go"
    };
    return LANGUAGE_NAMES[languageId] || "Unknown";
}
