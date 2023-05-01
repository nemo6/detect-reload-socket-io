;( () => {

	global["RELOAD_TIME"] = 65 // ms
	serverEx2()

})()

function serverEx2(){

	function makeid(x) {
		let text = ""
		let possible = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
		for ( let i=0;i<x;i++ ) text += possible.charAt( Math.floor( Math.random() * (possible.length + 1) ) ) // 11 => entre 0 et 11 compris
		return text
	}

	const expressSession = require("express-session")({
	secret:process.env.SECRET,
	resave:true,
	saveUninitialized:true
	})
	const sharedsession = require("express-socket.io-session")

	const express = require("express")
	const cors    = require("cors")
	const app     = express()
	const server  = require("http").createServer(app)
	const io      = require("socket.io")(server)
	const PORT    = 8080

	app.use(cors())
	app.use(expressSession)

	app.get("/",(req, res) => {

		if ( !req.session.unique_id ){
			req.session.unique_id = makeid(15)
		}
		res.sendFile( __dirname + "/index.html" )
	})

	server.listen(PORT)

	io.use( sharedsession(expressSession) )

	let hrstart=0
	let reload=false

	function promise_browser(socket){
		return new Promise( resolve => {
			socket.on("browser_name", (name) => {
				resolve(name)
			})
		})
	}

	io.on("connection", function (socket) {

		if( hrstart != 0 ){
			hrend = process.hrtime(hrstart)
			reload=true
			console.info("Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000)
			console.log(await promise_browser(socket),socket.handshake.session.unique_id)
		}

		socket.on("disconnect", function() {
			hrstart = process.hrtime()
			setTimeout( () => {
				if(reload){
					reload=false
				}
				else
				{process.exit(0)}
			}, RELOAD_TIME )
		})
	})
	console.log(`Running at port ${PORT}`)
}
