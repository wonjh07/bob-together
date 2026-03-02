begin;

-- Enable automatic RLS activation for newly created tables.
-- The handler function already limits scope to allowed schemas/tables.
do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_event_trigger
    where evtname = 'rls_auto_enable_on_ddl'
  ) then
    create event trigger rls_auto_enable_on_ddl
      on ddl_command_end
      execute function public.rls_auto_enable();
  end if;
end;
$$;

commit;
