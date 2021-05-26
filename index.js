const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const express = require('express');
var cors = require('cors')

function verifyCode(token, secret){
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'ascii',
        token: token
    })     
}

const usersMap = [{
        username: 'mauro',
        password: '12345',
        twoFactSecret: '',
        twoFactEnabled: false
    },
    {
        username: 'maria',
        password: '12345',
        twoFactSecret: '',
        twoFactEnabled: false
    }
]

const app = express();
app.use(cors())

app.listen('8080');



app.use(express.json());


app.post("/login", (request, response) => {
    const reqBody = request.body;

    const user = usersMap.find((u) => {
        return u.username === reqBody.username
    })
    if(user && user.password === reqBody.password){
        response.json({twoFactEnabled: user.twoFactEnabled})
    } else {
        response.send(401)
    } 
})

app.post("/login2fa", (request, response) => {
    const reqBody = request.body;

    const user = usersMap.find((u) => {
        return u.username === reqBody.username
    })

    if(verifyCode(reqBody.code, user.secret.ascii)){
        response.send(200);
    } else {
        response.send(401);
    }
})

app.post("/2faEnable", (request, response) => {
    const reqBody = request.body;

    const user = usersMap.find((u) => {
        return u.username === reqBody.username
    })    

    if(reqBody.twoFactEnabled){
        const secret = speakeasy.generateSecret({
            name: 'MonitoringCenter'
        });
        user.secret = secret;

        qrcode.toDataURL(secret.otpauth_url, function(err, data){
            if(err){
                response.send(400);
            } else{
                response.json({qrCodeSrc: data})
            }
        });
    } else {
        user.twoFactEnabled = reqBody.twoFactEnabled;
        user.secret = '';
        response.send(200);
    }
})

app.post("/confirm2faEnabling", (request, response) => {
    const reqBody = request.body;
    const user = usersMap.find((u) => {
        return u.username === reqBody.username
    })
    if(verifyCode(reqBody.code, user.secret.ascii)){
        console.log("Verified");
        user.twoFactEnabled = true;
        response.send(200);
    } else {
        response.send(401);
    }
})


