{# Por padrão o dbt prefixa o schema com o do perfil (public_staging). Aqui o schema é o nome que o modelo pede: staging, marts. #}
{% macro generate_schema_name(custom_schema_name, node) -%}
  {{ custom_schema_name if custom_schema_name is not none else target.schema }}
{%- endmacro %}
