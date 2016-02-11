"use strict";

export default class JSONRPC {
	constructor(base){
		if(!base) throw new Error('base is required')
		this.base = base
		this.PARSE_ERROR 		= this.error(-32700,'Parse Error')
		this.INVALID_REQUEST 	= this.error(-32600,'Invalid Request')
		this.METHOD_NOT_FOUND 	= this.error(-32601,'Method not found')
		this.INVALID_PARAMS		= this.error(-32602,'Invalid Params')
		this.INTERNAL_ERROR  	= this.error(-32603,'Internal Error')
	}
	handleRequest(req,res){
		var self = this
		var buffer = ''
		req.on('data',(data)=>buffer+=data.toString())
		req.on('end',()=>{
			try{ 
				var data = JSON.parse(buffer)
				var ret = []
				if(data instanceof Array)
				{
					async.map(data,self.doRPC.bind(self),(err,resp)=>res.json(err || resp.filter(v=>v)))
				}else
					self.doRPC(data,(err,resp)=>res.json(err || resp))
			}catch(ex){
				console.error('JSONRPC ERROR',ex)
				if(ex instanceof SyntaxError)
					res.json(self.PARSE_ERROR)
				else
					res.json(self.INTERNAL_ERROR,ex)
			}
		})
	}
	doRPC(data,cb){
		var self = this
		data.params = data.params || []
		if(data.jsonrpc != '2.0') 	return cb(null,self.INVALID_REQUEST)
		if(!data.method) 			return cb(null,self.INVALID_REQUEST)
		if(!self.base[data.method])	return cb(null,self.METHOD_NOT_FOUND)

		self.base[data.method](...data.params,(err,resp)=>{
			var ret = {}
			if(err)
				ret = self.error(-32000,ret.err.toString())
			else
				ret = self.success(resp.payload.toJSON().data)
			if(data.id)
				ret.id = data.id
			else
				ret = null
			cb(null,ret)
		})
	}
	success(result){
		var ret = {
			jsonrpc: '2.0',
			result: result
		}
		if(this.rpcDebug) console.log('success',ret)
		return ret;
	}
	error(code,msg,data){
		var ret = {
			jsonrpc: '2.0',
			error: {
				code: code,
				message: msg,
			}
		}
		if(data) ret.error.data = data
		if(this.rpcDebug) console.log('error',ret)
		return ret;
	}
}