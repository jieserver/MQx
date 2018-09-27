//TODO:端口及其它配置
const wss = require('socket.io')(8765)

const _ = require('lodash')

const _subIO = wss.of('/sub')
const _pubIO = wss.of('/pub')

_pubIO.on('connection',skt=>{
    skt.on('message',(e,d)=>_subIO.emit(e,d))
})

const _statIO = wss.of('/x')
var _cache = {}
_statIO.on('connection',skt=>{
    skt.on('set',(key,value)=>{
        _cache[key] = value
        _statIO.to(key).emit(key,value)
    }).on('get',(keys,cb)=>{
        (typeof keys == 'string') ? cb(_cache[keys]) : cb(_.pick(_cache,keys))
        //TODO:重连之后房间就没了
        skt.join(keys)
    }).on('del',(key)=>{
        delete _cache[key]
        _statIO.to(key).emit(key,undefined)
    })
})

