import React from 'react'

const mail = () => {
  return (
    <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Hi ${user.full_name},</h2>
        <p>You have ${unseenCount[userId]} unseen messages</p>
        <p>Click <a href={"${process.env.FRONTEND_URL}/messages"} style="color: #10b981;">here</a> to view them</p>
        <br />
        <p>Thanks,<br />PingUp - Stay Connected</p>
    </div>
  )
}

export default mail