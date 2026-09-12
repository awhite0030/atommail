export interface Email {
  id: number
  sender: string
  subject: string
  received_at: number
}

export interface EmailFull extends Email {
  recipient: string
  body_text: string
  body_html: string
}
