import  { NextApiRequest, NextApiResponse } from 'next';

let bot : any = null;


const message = (req: NextApiRequest, res: NextApiResponse) => {


  return Response.json({message: "Hello World"});
}


 


export const GET = message;