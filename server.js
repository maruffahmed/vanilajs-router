const fs = require('fs');
const http = require('http');
const path = require('path');


const server = http.createServer(function(req, res){

	if(req.url.split('/')[1] == 'static'){

		const p =  path.join(__dirname , req.url);
		fs.exists(p, exist=>{
			if(exist){
				const st = fs.statSync(p);
				if(st.isFile()){
			        fs.createReadStream(p).pipe(res);
				}else{ 
					res.writeHead(100, {'Content-Type': 'text/plain'});
					res.end(req.url);
				}
			}else {
				res.writeHead(404, {'Content-Type': 'text/plain'});
				res.end('Not found');
			}
		})

	}else {
		res.writeHead(200, {'Content-Type': 'text/html'});
		const readStream = fs.createReadStream(__dirname+'/index.html', 'utf8');
		readStream.pipe(res);
	}
	
});

server.listen(8000, '127.0.0.1');
console.log('Server is running on port 8000');