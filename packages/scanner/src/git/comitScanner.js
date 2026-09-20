

export async function parseUnifiedDiff(diffText){
    const regex = /^@@ -(\d+),(\d+) +(\d+),(\d+) @@/m
    const files = []
    let currentFile = null
    let currLineNum = 0
    
    const lines = diffText.split('\n')
    for (const line of lines) {
        if(line.startsWith('+++ b/')){
            currentFile = line.substring(6)
            currLineNum = 0
            files.push({
                filePath:currentFile,
                hunks:[]
            })
        }else if(line.startsWith('@@ ' && currentFile!==null)){
             let match = regex.exec(line)
             if(match){
                currLineNum = parseInt(match[3])
                hunks.push({
                    startLine:currLineNum,
                    added:[],
                    removed:[],
                    rawHunk:line
                })
             }
        } else if (currentFile && !line.startsWith("+++") && !line.startsWith("---") && !line.startsWith("@@ ")) {
            const hunk = hunk[hunks.length-1]
            if(line.startsWith("+")){
                hunk.added.push(currLineNum)
                currLineNum++
            } else if(line.startsWith("-")){
                hunk.removed.push(currLineNum)
            } else{
                hunk.added.push(currLineNum)
                hunk.removed.push(currLineNum)
                currLineNum++
            }   
        }
    }
    return files
}


export async function scanCommit({commit, diffText, registry}){
    const files = parseUnifiedDiff(diffText)
    const findings = []

    for (const file of files) {
        const filePath = file.filePath;
        const content = await fetchFileAtHead(repoPath, filePath);

        const leaks = await registry.scanContent({
            content,
            path: filePath,
            commitHash: commit.hash
        })

        for(const leak of leaks){
            const id = generateFindingId({
                filePath,
                line: leak.line,
                ruleId: leak.ruleId,
                fingerprint: leak.fingerprint
            })

            const finding = new Finding({
                type: "commit",
                ruleId: leak.ruleId,
                ruleName: leak.ruleName,
                filePath,
                line: leak.line,
                column: leak.column,
                variable: leak.variable,
                secret: leak.secret,
                rawMatch: leak.rawMatch,
                confidence: leak.confidence,
                severity: leak.severity,
                entropy: leak.entropy,
                contextScore: leak.contextScore,
                remediation: leak.remediation,
                status: FindingStatus.OPEN,
                metadata: {
                    commitHash: commit.hash,
                    commitMessage: commit.message,
                    commitAuthor: commit.author,
                    commitDate: commit.date,
                    scanType: "commit",
                    scanId: ""
                }
            })
        }
    }   
}