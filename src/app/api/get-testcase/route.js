import connection from "@/app/lib/db";
export async function GET(request) {
  let client;
  let result = [];
  try{
    const url = new URL(request.url, `http://${request.headers.host}`);
    const reqValue = url.searchParams.get('req');
    console.log('req:', reqValue);
    client = await connection.connect();
  }
  catch(err){
    console.error(err);
  }
  finally{
    try{

      result = await connection.query(`
        SELECT
        products.name, 
        products.id as prodId,
        products.picId as picId,
        products.properties as props,
        products.price,
        products.isonsale,
        products.saleprice,
        pictures.path as picPath,
        "types".name as typeName
        FROM products
        INNER JOIN 
        pictures ON products.picid = pictures.id
        INNER JOIN
        "types" ON products.typeid = "types".id;
        `);
        //client.release();
      }
      catch(err){
        console.error(err);
      }
      finally{
        return Response.json({ result });
      }
    // catch(error){
      //   return Response.error("bad", error);
      // }
    }
}