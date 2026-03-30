const { spawn } = require('child_process');

const mcp = spawn('npx', ['-y', '@testsprite/testsprite-mcp@latest'], {
    shell: true,
    env: { ...process.env, API_KEY: 'sk-user-M4wULSp2BWnkJaZO6zoRbzPqu3jFjnyebeMgCOdAs1glSm3YaW9oJMP8WrHR_VUFzTfUUAYthFVlJ0L0AbJ89HgQqKga6k9hcY5Newuys3OB1_UuseLftrY-vUBQqj2lpMc' }
});

let out = '';
mcp.stdout.on('data', data => {
    out += data.toString();
    try {
        const lines = out.split('\n');
        for (const line of lines) {
            if (line.trim()) {
                try {
                    const parsed = JSON.parse(line);
                    if (parsed.id === 1 && parsed.result) {
                        require('fs').writeFileSync('mcp_tools.json', JSON.stringify(parsed.result.tools, null, 2));
                        console.log('FOUND TOOLS: wrote to mcp_tools.json');
                        mcp.kill();
                        process.exit(0);
                    }
                } catch (e) {}
            }
        }
    } catch (e) {}
});

mcp.stderr.on('data', data => console.error('ERR:', data.toString()));

const req = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/list",
    params: {}
};

mcp.stdin.write(JSON.stringify(req) + '\n');

setTimeout(() => {
    console.log("Timeout waiting for tools...");
    mcp.kill();
    process.exit(1);
}, 15000);
