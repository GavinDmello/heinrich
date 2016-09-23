# Heinrich

A lightweight load-balancer written in Node.js which is highly available. It's made using the Reactor pattern in Node along with support for worker processes (one per core). You can however run a simple load-balancer with a single process by disabling the multiCore feature.

The load-balancer is programmed for high availability i.e if the worker process gets killed, it will be restarted. This ensures that the load on the other processes doesn't increase substantially.

Currently you'll have to clone the project & run the main file. I'll be writing installation & startup scripts for ubuntu & centos servers.

### Configuration file :-
The config.json file holds the entire config.

Example :-
```json
{
    "port" : 8080,
    "pingInterval" : 2000,
    "servers" : [
    { "host": "127.0.0.1", "port":8090},
    {"host": "127.0.0.1", "port": 9000}
    ],
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
#### Options :-
#### port
The port on which your load-balancer will run. The worker processes will share the same port and internally load-balance.

#### pingInterval
The interval at which the load-balancer will ping the list of underlying  servers. The number needs to be provided in milli seconds .The default is 1000 milli seconds.

#### servers
It's a list of servers on which the load-balancing will be conducted. The servers should be provided in a array of objects. Also ensure that the port is provided for all the hosts.

#### mode
There are three modes supported as of now.

 1.  Random routing
 2.  Round robin routing
 3.  Least connections routing


#### blackListAddress
If you figure out an client IP address which was trying a DOS attack. You can explicitly black list the IP address. A list of IP addresses can be provided. Any request emerging from these IP addresses will be rejected.

#### blockedUserAgent
According a user study, most of pseudo traffic usually comes from a clients having in-appropriate user-agents. The blockUserAgent is list of all the user agents you can block. The user agent should be in string format. The client requesting with these user agents will get 500 response code.

#### requestTimeout
This is counter against the `slowloris` attack. This could also happen if the clients are slow. Defense against such a situation would be to decide on a timeout value.If the request doesn't complete in the given timeout value, the client connection will be closed. Deciding on an optimum value here would be challenge. If this property is not provided then the load balancer would be susceptible to a possible DOS attack.

#### https
You can run the load-balancer in https mode by setting https flag equal to true. By default the load-balancer will run in http mode.
Remember to provide the key and the certificate. It will contain a boolean value (true/false)

#### multiCore
Enabling this feature ensures that all your cores are utilized. This mode guarantees more throughput as you have more processes serving requests. Disabling this feature will run a single loadbalancer which is highly unfavourable. It will contain a boolean value (true/false)

#### key
This will have the absolute address of the key

#### cert
This will have the absolute address of the certificate.


### Project roadmap :-

- [x] random routing
- [x] round robin routing
- [x] least connections routing
- [x] server health monitoring using tcp pings
- [x] https support
- [x] multi core usage
- [x] explicit blacklist
- [x] slowloris counter
- [ ] request queuing
- [ ] DOS counter
- [ ] DDOS counter
