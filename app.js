//------------------------------------------Module-------------------------------------------
//module bawaan/default atau tidak perlu install
var http  = require('http');
var url   = require('url');
var qString   = require('querystring');

//module yang perlu install terlebih dahulu
var router = require('routes')();
var view  = require('swig');
var mysql = require('mysql');

//----------------------------------------Database-------------------------------------------
//koneksi database
var connection=mysql.createConnection({
    host:"localhost",
    port:3306,
    database:"website_crud",
    user:"root",
    password:""
});

//------------------------------------------Route--------------------------------------------
//index
router.addRoute('/',function(req,res){
    var html=view.compileFile('./templates/index.html')({
        title:"Index",
    });
    res.writeHead(200,{"Content-Type" : "text/html"});
    res.end(html);
});

//buku
router.addRoute('/buku',function(req,res){
    if(req.method.toUpperCase()=='POST'){
        var data_post="";
        req.on('data',function(chuncks){
            data_post += chuncks;
        });
        req.on('end',function(){
            data_post =qString.parse(data_post);
            connection.query("insert into buku set ?", data_post,function(err,rows){
                if(err) throw err;
                res.setHeader('Content-Type', 'application/json');
            
                if(rows.affectedRows > 0){
                    res.statusCode=201;
                    res.end(JSON.stringify({"status": "success", "message": "Data has ben created", "data": []}));
                }else{
                    res.statusCode=202;
                    res.end(JSON.stringify({"status": "failed", "message": "Data not created", "data": []}));
                }
            });
        });

    }else if(req.method.toUpperCase()=='GET'){
        connection.query("select * from buku",function(err,rows){
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
			
            if(rows){
                res.statusCode=200;
                res.end(JSON.stringify({"status": "success", "message": "Data found", "data": rows}));
            }else{
                res.statusCode=204;
                res.end(JSON.stringify({"status": "failed", "message": "Data not found", "data": []}));
            }
        });
    }

    
});

router.addRoute('/buku/:id',function(req,res){
    var _id= this.params.id

    if(req.method.toUpperCase()=='GET'){
        connection.query("select * from buku where ?",{id : _id },function(err,rows){
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');

		
            if( rows){
                res.statusCode=200;
                res.end(JSON.stringify({"status": "success", "message": "Data found", "data": rows}));
            }else{
                res.statusCode=204;
                res.end(JSON.stringify({"status": "failed", "message": "Data not found", "data": []}));
            }
        });

    }else if(req.method.toUpperCase()=='PUT'){
        var data_post="";
        req.on('data',function(chuncks){
            data_post += chuncks;
        });
        req.on('end',function(){
            data_post =qString.parse(data_post);
			
            connection.query("update buku set ? where ?",[ data_post, { id :_id } ], function(err,rows){
                if(err) throw err;
                res.setHeader('Content-Type', 'application/json');
    
                if(rows.affectedRows > 0){
                    res.statusCode=200;
                    res.end(JSON.stringify({"status": "success", "message": "Data has ben updated", "data": []}));
                }else{
                    res.statusCode=204;
                    res.end(JSON.stringify({"status": "failed", "message": "Data not updated", "data": []}));
                }
            });
        });

    }else if(req.method.toUpperCase()=='DELETE'){
        connection.query("delete from buku where ?",{id : this.params.id },function(err,rows){
            if(err) throw err;
            res.setHeader('Content-Type', 'application/json');
            
            if(rows.affectedRows > 0){
                res.statusCode=200;
                res.end(JSON.stringify({"status": "success", "message": "Data has ben deleted", "data": []}));
            }else{
                res.statusCode=204;
                res.end(JSON.stringify({"status": "failed", "message": "Data not deleted", "data": []}));
            }
        });
    }else{

    }
    
});

 //--------------------------------------End Route-------------------------------------------
 
 //---------------------------------------Server---------------------------------------------
 //membuat server
http.createServer(function(req,res){
    var path =url.parse(req.url).pathname;
    var match=router.match(path);
	//menampilkan request url
	console.log(req.method+' '+req.url);

    if(match){
        match.fn(req,res);
    }else{
        var html=view.compileFile('./templates/404.html')();
        res.writeHead(404,{"Content-Type" : "text/html"});
        res.end(html);
    }
  
}).listen(8080);
 
console.log('Server is running at port 8080');