"use strict";

const {
    Octokit
} = require("@octokit/core");

const gitOpsApi = require("git-ops-api");
const serverUtils = require("../functions-common/server_utils.js");
const fetchJSONFile = require("../functions-common/fetchJSONFile.js").fetchJSONFile;

exports.handler = async function (event) {
    console.log("Received fetch_wordles request at " + new Date());

    // Reject when:
    // 1. The request when the request is not a GET request;
    // 2. Required environment variables are not defined.
    if (event.httpMethod !== "GET" || !serverUtils.isParamsExist()) {
        return serverUtils.invalidRequestResponse;
    }

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    try {
        const branches = await gitOpsApi.getAllBranches(octokit, {
            repoOwner: process.env.WORDLES_REPO_OWNER,
            repoName: process.env.WORDLES_REPO_NAME
        });

        let wordles = {};
        for (const branch of branches) {
            if (branch.name === "main") {
                continue;
            }
            wordles[branch.name] = await fetchJSONFile(octokit, branch.name, "src/_data/question.json");
        }
        return {
            statusCode: 200,
            body: JSON.stringify(wordles)
        };
    } catch (e) {
        console.log("fetch_wordles error: ", e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: e
            })
        };
    }
};
