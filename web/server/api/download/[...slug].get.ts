/* eslint-disable @typescript-eslint/no-unnecessary-condition */
type Param = "windows" | "linux/cli" | "macos/cli" | "linux/ui/deb" | "linux/ui/rpm" | undefined;

export default defineEventHandler(async (event) => {
  const param = event.context.params?.slug as Param;
  console.log(param);

  if (!param) {
    console.log('no param');
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
 
   const { exeVersion } = useRuntimeConfig(event);

   
   if (!exeVersion) {
     console.log('Error getting runtime config');
      throw createError({
        status: 500,
        statusMessage: 'Server error. please try again later',
      });
   }

  interface R2Object {
    size: number;
    body: ReadableStream;
  }
  interface R2Bucket {
    get(key: string): Promise<R2Object | null>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const bucket = event.context?.cloudflare?.env?.R2_BUCKET as R2Bucket | undefined;
  if (!bucket) {
    console.error('R2 binding is not configured');
    throw createError({ status: 500, statusMessage: 'Server error. please try again later' });
  }
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

    console.log('Fetching key:', getType);
    console.log('Config loaded:', { exeVersion });

    const r2Object = await bucket.get(getType);
    if (!r2Object) {
      console.log('Error getting binary: Not found');
      throw createError({
        status: 404,
        statusMessage: 'Server error. please try again later',
      });
    }
    
    setResponseHeaders(event, {
      "Content-Type": "application/octet-stream",
      "Content-Length": r2Object.size.toString(),
      "Content-Disposition": `attachment; filename="${getType.split('/').pop() ?? 'download'}"`,
    });

    return sendStream(event, r2Object.body);
});  