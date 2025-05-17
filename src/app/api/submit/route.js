export async function POST(request) {
  const data = await request.json();
  console.log('Received data:', data);
  // Process data...
  return Response.json({ success: true });
}