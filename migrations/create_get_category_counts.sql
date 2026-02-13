-- Create a function to get tool counts by category efficiently
create or replace function get_category_counts()
returns table (category text, count bigint)
language sql
as $$
  select category, count(*) as count
  from tools
  group by category
  order by count desc;
$$;