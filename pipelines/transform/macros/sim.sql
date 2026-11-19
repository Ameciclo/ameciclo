{# O SIM escreve NA ou deixa vazio o que não foi preenchido. #}
{% macro sim_limpo(col) -%}
  nullif(nullif(trim({{ col }}), ''), 'NA')
{%- endmacro %}

{# Código CID sem o asterisco que o SIM às vezes põe na frente. #}
{% macro sim_sem_asterisco(col) -%}
  regexp_replace({{ sim_limpo(col) }}, '^\*', '')
{%- endmacro %}

{# Código de município de 6 dígitos, ou nulo. #}
{% macro sim_municipio(col) -%}
  case when {{ sim_limpo(col) }} ~ '^\d{6}$' then {{ sim_limpo(col) }}::integer end
{%- endmacro %}
