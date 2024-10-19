import { updateAllWeakReferences } from "../../../actions/references";


export const dynamic = 'force-dynamic'; // static by default, unless reading the request
 
export async function GET(request: Request) {
  await updateAllWeakReferences()

  return new Response();
}