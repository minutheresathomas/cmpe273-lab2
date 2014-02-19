var connect = require('connect');
var login = require('./login');

var app = connect();

app.use(connect.json()); // Parse JSON request body into `request.body`
app.use(connect.urlencoded()); // Parse form in request body into `request.body`
app.use(connect.cookieParser()); // Parse cookies in the request headers into `request.cookies`
app.use(connect.query()); // Parse query string into `request.query`

app.use('/', main);

function main(request, response, next) {
	switch (request.method) {
		case 'GET': get(request, response); break;
		case 'POST': post(request, response); break;
		case 'DELETE': del(request, response); break;
		case 'PUT': put(request, response); break;
	}
};

function get(request, response) {
	var cookies = request.cookies;
	console.log(cookies);
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		if ( login.isLoggedIn(sid) ) {
			response.setHeader('Content-type', 'text/html');
			response.setHeader('Set-Cookie', 'session_id=' + sid);
			response.end(login.hello(sid));	
		} else {
			response.end("Invalid session_id! Please login again\n");
		}
	} else {
		response.end("Please login via HTTP POST\n");
	}
};

function post(request, response) {
	// TODO: read 'name and email from the request.body'
	// var newSessionId = login.login('xxx', 'xxx@gmail.com');
	// TODO: set new session id to the 'session_id' cookie in the response
	// replace "Logged In" response with response.end(login.hello(newSessionId));
	var name = request.body.name;
	var emailId = request.body.email;
	console.log("Name is : " + name + "\n");
	console.log("email is : " + emailId + "\n");
	var newSessionId
	 = login.login(name, emailId);
	if(login.isLoggedIn(newSessionId))
	{
		response.setHeader('Content-type', 'text/html' );
		response.setHeader('Set-Cookie', 'session_id=' + newSessionId);
		response.end(login.hello(newSessionId));
	}
	else
	{
		response.end("Invalid new session id! Please login again\n");
	}
	response.end("Logged In\n");
};

function del(request, response) {
	console.log("DELETE:: Logout from the server");
 	// TODO: remove session id via login.logout(xxx)
 	// No need to set session id in the response cookies since you just logged out!
 	var cookies = request.cookies;
 	var getsid = cookies['session_id'];
 	login.logout(getsid);
  	response.end('Logged out from the server\n');
};

function put(request, response) {
	console.log("PUT:: Re-generate new seesion_id for the same user");
	// TODO: refresh session id; similar to the post() function
	var cookies = request.cookies;
	if ('session_id' in cookies) {
		var sid = cookies['session_id'];
		var e_id = login.getUserEmail(sid);
		var u_name = login.getUserName(sid);
		var refreshedId = login.login(u_name, e_id);
		if(login.isLoggedIn(refreshedId))
		{
			response.setHeader('Content-type', 'text/html');
			response.setHeader('Set-Cookie', 'session_id=' + refreshedId);
			response.end("Re-freshed session id\n");
		} else{
			response.end("Invalid session id put! Please login again\n");
		}
	} else {
		response.end("Please login via HTTP POST\n");
	}
};

app.listen(8000);

console.log("Node.JS server running at 8000...");
