Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\GameServers\astroneer bridge"
WshShell.Run "cmd /c stop.bat", 0, True
WScript.Sleep 3000
WshShell.Run "cmd /c start.bat", 0, False
