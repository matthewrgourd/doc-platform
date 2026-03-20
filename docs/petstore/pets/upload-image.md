---
sidebar_position: 6
title: Upload an image
---

# Upload an image

Upload a photo for a pet with a POST request to `/pet/{petId}/uploadImage`.

## Request

Send the image as binary data with `Content-Type: application/octet-stream`:

```bash
curl -X POST "https://petstore3.swagger.io/api/v3/pet/1/uploadImage" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @photo.jpg
```

## Optional metadata

Add a query parameter for additional metadata:

```bash
curl -X POST "https://petstore3.swagger.io/api/v3/pet/1/uploadImage?additionalMetadata=Profile%20photo" \
  -H "Content-Type: application/octet-stream" \
  --data-binary @photo.jpg
```

## Response

```json
{
  "code": 200,
  "type": "unknown",
  "message": "additionalMetadata: Profile photo\nFile uploaded to ./photo.jpg"
}
```

## Errors

- **400**: No file uploaded
- **404**: Pet not found
