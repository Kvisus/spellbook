import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import { promisify } from "util";

const pump = promisify(require("stream").pipeline);

/**
 * API route for uploading files
 * @param {NextRequest} req - The Next.js request object
 * @param {NextResponse} res - The Next.js response object
 * @returns {Promise<NextResponse>} JSON object with upload status and data.
 */
export async function POST(req: NextRequest, res: NextResponse) {
  try {
    const formdata = await req.formData(); // Get form data from request body
    const files = formdata.getAll("files"); // Get array of files from form data with key "files"

    if (files.length > 0) {
      const file: File = files[0] as File; // Cast to File
      const filePath = `./public/${file.name}`; // Path to save file
      const fileStream = fs.createWriteStream(filePath); // Create write stream to file

      const readableStream = file.stream(); // Create readable stream from file

      await pump(readableStream, fileStream); // Pump readableStream to fileStream

      await new Promise((resolve, reject) => {
        fileStream.on("finish", resolve); // Wait for fileStream to finish writing before resolving promise
        fileStream.on("error", reject); // Reject promise if fileStream errors
      });

      return NextResponse.json({ status: "success", data: file.size }); // Return JSON with upload status and file size
    } else {
      return NextResponse.json({ status: "fail", data: "No file found" }); // Return JSON with upload status and error
    }
  } catch (error) {
    return NextResponse.json({ status: "fail", data: error }); // Return JSON with upload status and error
  }
}

//my own code
// export async function DELETE(req: NextRequest, res: NextResponse) {
//   try {
//     const filePath = `./public/${req.query.get("filePath")}`; // Get filePath from query

//     if (fs.existsSync(filePath)) {
//       fs.unlinkSync(filePath); // Delete file

//       return NextResponse.json({ status: "success", data: "File deleted" }); // Return JSON with delete status and message
//     } else {
//       return NextResponse.json({ status: "fail", data: "File not found" }); // Return JSON with delete status and error
//     }
//   } catch (error) {
//     return NextResponse.json({ status: "fail", data: error }); // Return JSON with delete status and error
//   }
// }
