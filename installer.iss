[Setup]
AppName=Solana Bot
AppVersion=1.0
DefaultDirName={autopf}\SolanaBot
DefaultGroupName=Solana Bot
OutputBaseFilename=SolanaBotInstaller
Compression=lzma
SolidCompression=yes
PrivilegesRequired=admin
Uninstallable=yes

[Files]
Source: "/build/cli/solana-bots-win.exe"; DestDir: "{app}"; DestName: "solana-bots.exe"; Flags: ignoreversion
Source: "build\migrations\*"; DestDir: "{app}\migrations"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\Solana Bot"; Filename: "{app}\solana-bots.exe"; WorkingDir: "{app}"
Name: "{commondesktop}\Solana Bot"; Filename: "{app}\solana-bots.exe"; WorkingDir: "{app}"


[Code]
const
    MY_HWND_BROADCAST = $FFFF;
    MY_WM_SETTINGCHANGE = $001A;
    MY_SMTO_ABORTIFHUNG = 2;

function SendMessageTimeout(hWnd: LongInt; Msg: LongInt; wParam: LongInt; lParam: String; fuFlags: LongInt; uTimeout: LongInt; var lpdwResult: LongInt): LongInt;
    external 'SendMessageTimeoutW@user32.dll stdcall';

procedure RefreshEnvironment;
var
    Dummy: LongInt;
begin
    SendMessageTimeout(MY_HWND_BROADCAST, MY_WM_SETTINGCHANGE, 0, 'Environment', MY_SMTO_ABORTIFHUNG, 5000, Dummy);
end;

procedure AddToPath;
var
    OldPath: String;
    NewPath: String;
    AppPath: String;
begin
    AppPath := ExpandConstant('{app}');
    if RegQueryStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'Path', OldPath) then
    begin
        if Pos(Lowercase(AppPath), Lowercase(OldPath)) = 0 then
        begin
            NewPath := OldPath + ';' + AppPath;
            RegWriteExpandStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'Path', NewPath);
        end;
    end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
    if CurStep = ssPostInstall then
    begin
        AddToPath();
        RefreshEnvironment();
    end;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
    sCurrent: String;
    sAppPath: String;
    sCurLower: String;
    sAppLower: String;
    p, startIdx, endIdx: Integer;
begin
    if CurUninstallStep = usPostUninstall then
    begin
        sAppPath := ExpandConstant('{app}');
        if RegQueryStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'Path', sCurrent) then
        begin
            sCurLower := Lowercase(sCurrent);
            sAppLower := Lowercase(sAppPath);
            p := Pos(sAppLower, sCurLower);
            while p > 0 do
            begin
                startIdx := p;
                endIdx := p + Length(sAppLower) - 1;
                if (startIdx > 1) and (sCurLower[startIdx-1] = ';') then
                    startIdx := startIdx - 1;
                if (endIdx < Length(sCurLower)) and (sCurLower[endIdx+1] = ';') then
                    endIdx := endIdx + 1;
                Delete(sCurrent, startIdx, endIdx - startIdx + 1);
                sCurLower := Lowercase(sCurrent);
                p := Pos(sAppLower, sCurLower);
            end;

            while Pos(';;', sCurrent) > 0 do
                Delete(sCurrent, Pos(';;', sCurrent), 1);

            while (Length(sCurrent) > 0) and (sCurrent[1] = ';') do
                Delete(sCurrent, 1, 1);
            while (Length(sCurrent) > 0) and (sCurrent[Length(sCurrent)] = ';') do
                Delete(sCurrent, Length(sCurrent), 1);

            if RegWriteExpandStringValue(HKLM, 'SYSTEM\CurrentControlSet\Control\Session Manager\Environment', 'Path', sCurrent) then
            begin
                RefreshEnvironment();
            end;
        end;
    end;
end;