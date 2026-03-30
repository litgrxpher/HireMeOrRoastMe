const { spawn } = require('child_process');

const mcp = spawn('npx', ['-y', '@testsprite/testsprite-mcp@latest'], {
    shell: true,
    env: { ...process.env, API_KEY: process.env.TESTSPRITE_API_KEY }
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
                            require('fs').writeFileSync('dashboard_result.txt', c.text);
                            console.log(`[Result]: wrote to dashboard_result.txt`);
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
    try {
        console.log("Opening dashboard natively via MCP...");
        await callTool('testsprite_open_test_result_dashboard', {
            projectPath,
            modificationContext: ""
        });
    } catch (e) {
        console.error(e);
    } finally {
        mcp.kill();
        process.exit(0);
    }
}

setTimeout(run, 2000);
