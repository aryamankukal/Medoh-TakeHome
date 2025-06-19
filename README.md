# Medoh Doctor Invite Tool

## Technologies Used
- Next.js
- React
- TypeScript
- Supabase
- Tailwind CSS

## Features
- **Clean, Medoh-themed UI:** Orange/white, responsive, and modern.
- **Doctor name & patient phone input:** With validation and green checkmarks for valid entries.
- **Send Invite button:** Enabled only when inputs are valid.
- **Simulated SMS sending:** Prints SMS to terminal with a unique, reusable link with ref code (`/visit/[doctorName]?ref=xxxxxx`).
- **Bulk CSV upload:** Send invites to multiple patients at once.
- **Confirmation messages:** Clear feedback after sending (single or bulk).
- **Invite history:** View all sent invites in a modal.
- **Session persistence:** Doctor name is remembered via localStorage.
- **Supabase integration:** All invites are stored in a Supabase table (`invites`).

## Setup Instructions
1. **Install dependencies:**
   ```bash
   npm install
   # or yarn install
   ```
2. **Configure Supabase:**
   - Create a Supabase project and an `invites` table with columns: `doctor_id` (text), `phone` (text), `sent_at` (timestamp, default now()).
   - Add your Supabase keys to `.env.local`:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
3. **Run the development server:**
   ```bash
   npm run dev
   # or yarn dev
   ```
4. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Mock SMS Message Format
When you send an invite, a simulated SMS is printed to your terminal in the following format:

```
--- MOCK SMS ---
To: (510) 386-7466
Message: Hi! Dr doctorName has invited you to view their Medoh profile: http://localhost:3000/visit/doctorName?ref=xxxxxx
----------------
```

## How would you improve this tool in a real production setting?

- Implement authentication to make sure only verified doctors are able to send invites
- Write RLS policies so that only authenticated doctors can access, insert, or view their own invites
- Validate phone numbers a bit more in depth for format, country code, etc.
- Use Twilio to actually deliver messages
- Add rate limiting per hour or day to prevent spam and to not go over user's sms budget
- Add more to UI in terms of animations and make it more dynamic all throughout
