insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public;
