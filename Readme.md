# Heinrich  &nbsp;&nbsp;[![Build Status](https://travis-ci.org/GavinDmello/heinrich.svg?branch=master)](https://travis-ci.org/GavinDmello/heinrich.svg?branch=master)&nbsp;

A load-balancer written in Node.js which is highly available. It's made using the Reactor pattern in Node along with support for worker processes (one per core). You can however run a simple load-balancer with a single process by disabling the multiCore feature.

The load is shared evenly amongs all processes and if the worker process dies for some reason, a new worker process replaces it.

You can also configure an smtp server with `heinrich`. Mails will be sent whenever one or more of the backend servers go down.

Currently you'll have to clone the project & run the main file. I'll be writing installation & startup scripts for ubuntu & centos servers. Also, we currently support only GET
& POST methods.

-------------------------------------------------------
### Configuration file :-
The config.json file holds the entire config. An example config is shown below
It has the bare minimum you require to run this load balancer.

Example :-
```json
{
    "port" : 8080,
    "pingInterval" : 2000,
    "servers" : [{ "host": "127.0.0.1", "port":8090, "https" : true},{"host": "127.0.0.1", "port": 9000}],
    "mode" : 1,
    "blackListAddress": ["1.2.3.4"],
    "blockedUserAgent":[],
    "requestTimeout": 10,
    "https" : true,
    "multiCore" : true,
    "key" : "/home/keys/key.pem",
    "cert": "/home/keys/cert.pem"
}
```

-------------------------------------------------------
#### Options :-
#### port
The port on which your load-balancer will run. The worker processes will share the same port and internally load-balance.

#### pingInterval
The interval at which the load-balancer will ping the list of underlying  servers. The number needs to be provided in milli seconds .The default is 1000 milli seconds.

#### servers
It's a list of servers on which the load-balancing will be conducted. The servers should be provided in a array of objects. Also ensure that the port is provided for all the hosts. You can also specify an https property for https backend servers.

#### mode
There are three modes supported as of now.

 1.  Random routing
 2.  Round robin routing
 3.  Least connections routing


#### blackListAddress
If you figure out an client IP address which was trying a DOS attack. You can explicitly black list the IP address. A list of IP addresses can be provided. Any request emerging from these IP addresses will be rejected.

#### blockedUserAgent
According a user study, most of pseudo traffic usually comes from a clients having in-appropriate user-agents. The blockUserAgent is list of all the user agents you can block. The user agent should be in string format. The client requesting with these user agents will get 500 response code.

#### concurrency
This should be a number. It defines how many sockets should be open per origin

#### requestTimeout
This is counter against the `slowloris` attack. This could also happen if the clients are slow. Defense against such a situation would be to decide on a timeout value.If the request doesn't complete in the given timeout value, the client connection will be closed. Deciding on an optimum value here would be challenge. If this property is not provided then the load balancer would be susceptible to a possible DOS attack.

#### https
You can run the load-balancer in https mode by setting https flag equal to true. By default the load-balancer will run in http mode.
Remember to provide the key and the certificate. It will contain a boolean value (true/false)

#### reporting
You can configure heinrich with an smtp server. Whenever backend server(s) experience downtime, the
configured email receipients will be notified via email about the downtime. You will need to provide the host, port  of the smtp server  and also the credentials of the user sending the email in case secure mode is enabled.

```json
    "reporting": {
        "host": "localhost",
        "port": 5000,
        "secure": true,
        "user": "abc@abc.com",
        "pass": "123",
        "receipients": ["xyz@abc.com", "ijk@abc.com"]
    }
```

#### multiCore
Enabling this feature ensures that all your cores are utilized. This mode guarantees more throughput as you have more processes serving requests. Disabling this feature will run a single loadbalancer which is highly unfavourable. It will contain a boolean value (true/false)

#### limitBandwidth
This is an optional property. If you want to limit the upstream & downstream bandwidth of the
user then you provide the rates in terms of bytes.This will be done on for every connection.
You can put this in the config.json where upstream & downstreams are the rates.

```json
    "limitBandwidth": {
        "upStream": 10,
        "downStream": 10
    }
```

#### RateLimiting
This is an optional property. You can provide the routes to be rate limited and the interval. The way this will work is that it will allow every client IP to hit the routes only once during that interval. Other requests within that interval will be responded with a `503` response.
Here the `rateLimitedRoutes` property is an array of strings and `rateLimitInterval` is an integer which denotes the time in milliseconds.
```json
    "rateLimit": {
        "rateLimitedRoutes" : ["/signup", "/register"],
        "rateLimitInterval" : 1000
    }
```
In case if you want to run the server in multi core more and use rate limiting , you will have to plug in Redis.
Example config for the server in multi core mode with rate limiting
```json
    "rateLimit": {
        "host":"0.0.0.0",
        "port": 6379,
        "rateLimitedRoutes" : ["/signup", "/register"],
        "rateLimitInterval" : 1000
    }
```

#### key
This will have the absolute address of the key

#### cert
This will have the absolute address of the certificate.

-------------------------------------------------------
### Dashboard
You can go to http://localhost:4200/
`default username` : test
`default password` : test@123

![Screenshot](https://github.com/GavinDmello/heinrich/blob/master/dashboard/img/1.png)
![Screenshot](https://github.com/GavinDmello/heinrich/blob/master/dashboard/img/2.png)

Few metric are being tracked as of now

-------------------------------------------------------
### Project roadmap :-

- [x] random routing
- [x] round robin routing
- [x] least connections routing
- [x] server health monitoring using tcp pings
- [x] https support
- [x] multi core usage
- [x] explicit blacklist
- [x] slowloris counter
- [x] email reporting about downtime
- [x] bandwidth limiting for upstream & downstream components
- [x] rate limiting
- [x] analytics
- [x] simple dashboard
- [x] SSL termination
- [ ] external cache
- [ ] unit test cases
- [ ] request queuing
- [ ] DOS counter
- [ ] DDOS counter

-------------------------------------------------------
### LICENSE

BSD
