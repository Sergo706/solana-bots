/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import Bucket from "~~/server/utils/s3";
type Param = "windows" | "linux/cli" | "macos/cli" | "linux/ui/deb" | "linux/ui/rpm" | undefined;

export default defineEventHandler(async (event) => {
  const param = event.context.params?._ as Param;

  if (!param) {
    throw createError({
      status: 404,
      statusMessage: 'This page doesnt exists',
    });
  }

  if (
    param !== 'windows' && 
    param !== "linux/cli" &&
    param !== "linux/ui/deb" &&
    param !== 'linux/ui/rpm' && 
    param !== 'macos/cli'
  ) {
     console.log('Invalid path used');
      throw createError({
      status: 404,
      statusMessage: 'This page doesnt exists',
    });
  }
 
   const {exeVersion, R2_ACCESS_KEY_ID, R2_ACCOUNT_ID, R2_BUCKET, R2_SECRET_ACCESS_KEY} = useRuntimeConfig(event);
   
   if (!exeVersion && !R2_ACCESS_KEY_ID && !R2_ACCOUNT_ID && !R2_BUCKET && !R2_SECRET_ACCESS_KEY) {
     console.log('Error getting runtime config');
      throw createError({
        status: 500,
        statusMessage: 'Server error. please try again later',
      });
   }

   const bucket = new Bucket(
     R2_ACCOUNT_ID, 
     R2_ACCESS_KEY_ID, 
     R2_SECRET_ACCESS_KEY, 
     R2_BUCKET
   );

    // keys references
// solana-bots/releases/V1.0.0/windows-installer-V1.0.0/SolanaBotsInstaller.exe
// solana-bots/releases/V1.0.0/cli/solana-bots-macos
// solana-bots/releases/V1.0.0/cli/solana-bots-linux
// solana-bots/releases/V1.0.0/ui/deb-x64-V1.0.0/solana-bots_1.0.0_amd64.deb
// solana-bots/releases/V1.0.0/ui/rpm-x64-V1.0.0/solana-bots-1.0.0-1.x86_64.rpm


   const keyMap: Record<NonNullable<Param>, string> = {
     "windows": `releases/V${exeVersion}/windows-installer-V${exeVersion}/SolanaBotsInstaller.exe`,
     "macos/cli": `releases/V${exeVersion}/cli/solana-bots-macos`,
     "linux/cli": `releases/V${exeVersion}/cli/solana-bots-linux`,
     "linux/ui/deb": `releases/V${exeVersion}/ui/deb-x64-V${exeVersion}/solana-bots_${exeVersion}_amd64.deb`,
     "linux/ui/rpm": `releases/V${exeVersion}/ui/rpm-x64-V${exeVersion}/solana-bots-${exeVersion}-1.x86_64.rpm`
   };

   const getType = keyMap[param as NonNullable<Param>];

  
    const get = await bucket.getPublicAccess(getType);
    if (!get.ok) {
      console.log('Error getting binary');
      throw createError({
        status: 500,
        statusMessage: 'Server error. please try again later',
      });
    }
    
    const data = get.data;
    setResponseHeaders(event, {
      "Content-Type": "application/octet-stream",
      "Content-Length": data.ContentLength?.toString() ?? "",
      "Content-Disposition": `attachment; filename="${getType.split('/').pop() ?? 'download'}"`,
    });

    return sendStream(event, data.Body as ReadableStream);
});  