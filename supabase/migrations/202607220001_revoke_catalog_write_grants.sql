revoke insert, update, delete, truncate, references, trigger
on public.institutions, public.exam_boards, public.exam_programs, public.exam_editions
from authenticated;

grant select
on public.institutions, public.exam_boards, public.exam_programs, public.exam_editions
to authenticated;

