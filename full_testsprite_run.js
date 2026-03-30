const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const mcp = spawn('npx', ['-y', '@testsprite/testsprite-mcp@latest'], {
    shell: true,
    env: { ...process.env, API_KEY: 'sk-user-M4wULSp2BWnkJaZO6zoRbzPqu3jFjnyebeMgCOdAs1glSm3YaW9oJMP8WrHR_VUFzTfUUAYthFVlJ0L0AbJ89HgQqKga6k9hcY5Newuys3OB1_UuseLftrY-vUBQqj2lpMc' }
});

const requests = {};
let msgId = 1;
let buffer = '';

mcp.stdout.on('data', data => {
    buffer += data.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop();

    for (const line of lines) {
        if (!line.trim()) continue;
        try {
            const parsed = JSON.parse(line);
            if (parsed.id && requests[parsed.id]) {
                requests[parsed.id](parsed);
                delete requests[parsed.id];
            }
        } catch (e) {}
    }
});

function callTool(name, args) {
    return new Promise((resolve, reject) => {
        const id = msgId++;
        requests[id] = (response) => {
            if (response.error) {
                console.error(`Tool ${name} failed:`, response.error);
                reject(response.error);
            } else {
                console.log(`Tool ${name} succeeded.`);
                if (response.result && response.result.content) {
                    response.result.content.forEach(c => {
                        if (c.type === 'text') {
                            console.log(`[${name} output]:`, c.text);
                        }
                    });
                }
                resolve(response.result);
            }
        };
        const req = { jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: args } };
        mcp.stdin.write(JSON.stringify(req) + '\n');
    });
}

async function run() {
    const projectPath = 'C:\\Users\\athir\\.gemini\\antigravity\\scratch\\HireMeOrRoastMe\\frontend';
    const projectName = "frontend";
    
    try {
        console.log("1. Account Check...");
        await callTool('testsprite_check_account_info', {});

        console.log("2. Bootstrapping...");
        await callTool('testsprite_bootstrap', {
            localPort: 5173,
            pathname: "",
            type: "frontend",
            projectPath,
            testScope: "codebase"
        });

        console.log("3. Generating Code Summary...");
        await callTool('testsprite_generate_code_summary', {
            projectRootPath: projectPath
        });

        console.log("4. Generating Standardized PRD...");
        await callTool('testsprite_generate_standardized_prd', {
            projectPath
        });
        
        console.log("5. Generating Test Plan...");
        await callTool('testsprite_generate_frontend_test_plan', {
            projectPath,
            needLogin: false
        });
        
        console.log("6. Executing Tests...");
        await callTool('testsprite_generate_code_and_execute', {
            projectName,
            projectPath,
            testIds: [],
            additionalInstruction: "Perform a comprehensive smoke test of the landing page and form validation.",
            serverMode: "development"
        });
        
        console.log("--- WORKFLOW COMPLETE ---");
    } catch (e) {
        console.error("Workflow halted due to error:", e);
    } finally {
        mcp.kill();
        process.exit(0);
    }
}

setTimeout(run, 3000);
