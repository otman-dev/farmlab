import { NextRequest, NextResponse } from "next/server";
import { getCloudConnection } from "@/lib/mongodb-cloud";
import ContactCloud from "@/models/Contact.cloud";

export async function POST(request: NextRequest) {
  try {
    const { email, subject, message, phone } = await request.json();

    // Validate required fields
    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: "Email, subject, and message are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address" },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters long" },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { error: "Message must be less than 2000 characters" },
        { status: 400 }
      );
    }

    // Validate subject length
    if (subject.length > 200) {
      return NextResponse.json(
        { error: "Subject must be less than 200 characters" },
        { status: 400 }
      );
    }

    // Validate phone number if provided
    if (phone && phone.trim()) {
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{8,20}$/;
      if (!phoneRegex.test(phone.trim())) {
        return NextResponse.json(
          { error: "Please enter a valid phone number" },
          { status: 400 }
        );
      }
    }

    // Connect to database
    const conn = await getCloudConnection();
    const ContactModel = conn.models.ContactCloud || conn.model('ContactCloud', ContactCloud.schema);

    // Determine priority based on keywords in subject/message
    let priority: "low" | "medium" | "high" = "medium";
    const combinedText = `${subject} ${message}`.toLowerCase();
    
    const highPriorityKeywords = ["urgent", "emergency", "critical", "asap", "immediately", "down", "not working", "error"];
    const lowPriorityKeywords = ["question", "inquiry", "info", "information", "demo", "pricing"];
    
    if (highPriorityKeywords.some(keyword => combinedText.includes(keyword))) {
      priority = "high";
    } else if (lowPriorityKeywords.some(keyword => combinedText.includes(keyword))) {
      priority = "low";
    }

    // Auto-generate tags based on content
    const tags: string[] = [];
    if (combinedText.includes("iot") || combinedText.includes("sensor")) tags.push("iot");
    if (combinedText.includes("farm") || combinedText.includes("agriculture")) tags.push("farming");
    if (combinedText.includes("pricing") || combinedText.includes("cost")) tags.push("pricing");
    if (combinedText.includes("demo") || combinedText.includes("demonstration")) tags.push("demo");
    if (combinedText.includes("support") || combinedText.includes("help")) tags.push("support");
    if (combinedText.includes("partnership") || combinedText.includes("collaborate")) tags.push("partnership");

    // Create contact record
    const contact = new ContactModel({
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      phone: phone ? phone.trim() : undefined,
      priority,
      tags,
    });

    await contact.save();

    // Log successful contact submission (for monitoring)
    console.log(`New contact submission from ${email} with subject: ${subject}`);

    return NextResponse.json(
      { 
        message: "Message sent successfully! We'll get back to you within 24 hours.",
        id: contact._id 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Contact form submission error:", error);
    
    // Handle specific MongoDB errors
    if (error instanceof Error) {
      if (error.message.includes("validation")) {
        return NextResponse.json(
          { error: "Please check your input and try again" },
          { status: 400 }
        );
      }
      
      if (error.message.includes("duplicate")) {
        return NextResponse.json(
          { error: "A message with this information already exists" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve contact messages (for admin use)
export async function GET() {
  // This endpoint is for future admin functionality
  // Currently returning a simple response
  return NextResponse.json({
    message: "Contact retrieval endpoint - admin functionality coming soon",
    contacts: [],
    pagination: {
      total: 0,
      limit: 10,
      skip: 0,
      hasMore: false
    }
  });
}