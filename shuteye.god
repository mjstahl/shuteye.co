God.watch do |w|
    w.name = "shuteye"
    w.start = "nodejs /home/deploy/shuteye.co/server.js"
    w.keepalive(:cpu_max => 80.percent)
end