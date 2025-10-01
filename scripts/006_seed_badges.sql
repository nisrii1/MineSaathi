-- Seed initial badges
insert into public.badges (name, description, points_required, rarity) values
  ('Safety First', 'Complete your first safety checklist', 0, 'common'),
  ('Week Warrior', 'Complete checklists for 7 consecutive days', 100, 'uncommon'),
  ('Hazard Hunter', 'Report your first hazard', 0, 'common'),
  ('Guardian Angel', 'Report 10 hazards', 200, 'rare'),
  ('Wellness Champion', 'Complete 30 wellness check-ins', 300, 'rare'),
  ('Perfect Week', 'Complete all tasks for a week without missing any', 500, 'epic'),
  ('Safety Legend', 'Reach 1000 total points', 1000, 'legendary')
on conflict (name) do nothing;
