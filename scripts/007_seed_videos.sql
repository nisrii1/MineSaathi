-- Seed initial safety videos
insert into public.safety_videos (title, description, video_url, thumbnail_url, duration, category, language) values
  ('Emergency Evacuation Procedures', 'Learn the proper evacuation routes and assembly points', '/videos/evacuation.mp4', '/placeholder.svg?height=200&width=300', 180, 'emergency', 'en'),
  ('Personal Protective Equipment', 'How to properly wear and maintain your PPE', '/videos/ppe.mp4', '/placeholder.svg?height=200&width=300', 240, 'equipment', 'en'),
  ('First Aid Basics', 'Essential first aid procedures for common injuries', '/videos/first-aid.mp4', '/placeholder.svg?height=200&width=300', 300, 'health', 'en'),
  ('Fire Safety', 'Fire prevention and response procedures', '/videos/fire-safety.mp4', '/placeholder.svg?height=200&width=300', 200, 'emergency', 'en')
on conflict do nothing;
