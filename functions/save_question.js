"use strict";

const {
    Octokit
} = require("@octokit/core");

const gitOpsApi = require("git-ops-api");
const fetchJSONFile = require("../functions-common/fetchJSONFile.js").fetchJSONFile;
const allowedParameters = ["branchName", "workshop-name", "question", "entries"];

exports.handler = async function (event) {
    console.log("Received save_question request at " + new Date() + " with path " + event.path);
    const parameters = JSON.parse(event.body);

    // Reject the request when:
    // 1. Not a POST request;
    // 2. Doesn’t provide required values;
    // 3. Provided parameter names are not allowed;
    const paramsAllValid = Object.keys(parameters).every(paramKey => allowedParameters.includes(paramKey));
    if (event.httpMethod !== "POST" || !parameters.branchName || !paramsAllValid ||
        !process.env.ACCESS_TOKEN || !process.env.WORDLES_REPO_OWNER || !process.env.WORDLES_REPO_NAME) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid HTTP request method or missing field values or missing environment variables."
            })
        };
    }

    // Reject if the entries value is not an integer and greater than 0.
    const entries = parseInt(parameters.entries) || 0;
    if (parameters.entries && entries === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "The value of entries must be an integer and greater than 0."
            })
        };
    }

    const octokit = new Octokit({
        auth: process.env.ACCESS_TOKEN
    });
    const branch = parameters.branchName;

    try {
        const questionFilePath = "src/_data/question.json";
        // Fetch the current question.json file content
        const questionFileInfo = await fetchJSONFile(octokit, branch, questionFilePath);
        console.log("Got questionFileInfo ", JSON.stringify(questionFileInfo));

        let newQuestionFileInfo = questionFileInfo.content;
        if (parameters["workshop-name"]) {
            newQuestionFileInfo.workshopName = parameters["workshop-name"];
        }
        if (parameters.question) {
            newQuestionFileInfo.question = parameters.question;
        }
        if (parameters.entries) {
            newQuestionFileInfo.entries = entries;
        }
        newQuestionFileInfo.lastModifiedTimestamp = new Date().toISOString();

        console.log("Save newQuestionFileInfo: ", JSON.stringify(newQuestionFileInfo));

        await gitOpsApi.updateSingleFile(octokit, {
            repoOwner: process.env.WORDLES_REPO_OWNER,
            repoName: process.env.WORDLES_REPO_NAME,
            branchName: branch,
            filePath: questionFilePath,
            fileContent: JSON.stringify(newQuestionFileInfo),
            commitMessage: "chore: [skip ci] update question.json via the manage wordles page",
            sha: questionFileInfo.sha
        });

        return {
            statusCode: 200,
            body: JSON.stringify(newQuestionFileInfo)
        };
    } catch (e) {
        console.log("save_question error: ", e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: e
            })
        };
    }
};
