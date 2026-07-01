export async function POST(request) {
  const data = await request.json();
  console.log('Received data:', data);
  return Response.json({ success: true });
}