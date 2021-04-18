const fs = require('fs');

const requestHandler = (req, res) => {
    const url = req.url;
    const method = req.method;

    /* home route */
    if (url === '/') { 
        // send chunks of body
        res.write('<html>');
        res.write('</head><title>Node Home</title></head>');
        res.write('<body><form action="/message" method="POST"><input type="text" name="message"><button type="submit">Send</button></form></body>');
        res.write('</html>');
        // finish sending the request
        return res.end();
    }

    /* home on submit message form post */
    if (url === '/message' && method === 'POST') { 
        const body = [];
        // stream event listener - consume data
        req.on('data', (chunk) => {
            body.push(chunk);
        });
        // stream event listener - runs once data is consumed
        return req.on('end', () => {
            const parsedBody = Buffer.concat(body).toString();
            const message = parsedBody.split('=')[1]; // ugly but works as an example
            // write to file
            fs.writeFile('message.txt', message, err => {
                // callback once writeFile is done - 
                // set status code and redirect location
                res.statusCode = 302;
                res.setHeader('Location', '/');
                // finish sending the request
                return res.end();
            });
        });
    }

    /* Default route */

     // set headers
    res.setHeader('Content-Type', 'text/html');
    // send chunks of body
    res.write('<html>');
    res.write('</head><title>Node</title></head>');
    res.write('<body><h1>Hello</h1></body>');
    res.write('</html>');
    // finish sending the request
    res.end();
}

// module.exports = {
//     handler: requestHandler
// }
exports.handler = requestHandler;