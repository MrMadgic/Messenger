export const uploadFile = (cloudinary: any) => {
  return (content: string) => {
    return new Promise((resolve) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'chat-users',
            eager: [{ width: 400, height: 400, crop: 'crop', gravity: 'face' }],
          },
          (err: any, result: any) => {
            if (err) {
              console.log('err: ', err)
              throw new Error(err)
            }
            resolve(result)
          }
        )
        .end(content)
    })
  }
}
