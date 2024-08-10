#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

function _help_and_exit(cmd) {
    let h = ''
    switch (cmd) {
        case 'comparedir': {
            h = 'Usage: hwtk comparedir <dir1> <dir2>'
        } break

        default:
            h = 'Usage: hwtk <cmd> <args...>'
            break
    }

    console.log(h)
    process.exit(0)
}

//internal tools
function _is_file(f) {
    try {
        const s = fs.statSync(f)
        return s.isFile()
    }
    catch (e) {
        console.error(e)
        return false
    }
}

function _is_dir(f) {
    try {
        const s = fs.statSync(f)
        return s.isDirectory()
    }
    catch (e) {
        console.error(e)
        return false
    }
}

function _get_files(dir) {
    if (!fs.existsSync(dir) || !_is_dir(dir)) {
        return []
    }

    return fs.readdirSync(dir, { recursive: true }).filter(f => _is_file(path.join(dir, f)))
}

function _compare_lists(list1, list2) {
    const diff = {
        '-': [],
        '+': [],
        'M': []
    }

    if (!Array.isArray(list1) || !Array.isArray(list2)) return diff

    const dict1 = {}
    const dict2 = {}
    for (const li of list1) dict1[li] = true
    for (const li of list2) dict2[li] = true

    for (const li of list1) {
        if (!dict2[li]) {
            diff['-'].push(li)
        }
    }

    for (const li of list2) {
        if (!dict1[li]) {
            diff['+'].push(li)
        }
    }

    return diff
}


//tools
class Tools {
    comparedir(d1, d2) {
        if (!d1 || !d2 || !fs.existsSync(d1) || !fs.existsSync(d2) || !_is_dir(d1) || !_is_dir(d2)) {
            _help_and_exit('comparedir')
        }
    
        const list1 = _get_files(d1)
        const list2 = _get_files(d2)
    
        const diff = _compare_lists(list1, list2)

        return diff
    }
}

const tools = new Tools()

if (require.main === module) {
    //命令行模式
    function parse_args() {
        const args = process.argv.slice(2)
        if (!args[0]) {
            _help_and_exit()
        }
    
        switch (args[0]) {
            case 'help': {
                _help_and_exit(args[1])
                break
            }
    
            default: {
                if (typeof tools[args[0]] === 'function') {
                    const ret = tools[args[0]].apply(tools, args.slice(1))
                    if (ret) {
                        console.log(JSON.stringify(ret, null, 2))
                    }
                    break
                }
            }
        }
    }
    //main
    (function main() {
        parse_args()
    })()
}
else {
    //模块
    module.exports = tools
}
