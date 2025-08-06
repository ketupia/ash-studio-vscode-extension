defmodule Specification do
  use Ash.Resource,
    domain: Domain,
    data_layer: AshNeo4j.DataLayer

  neo4j do
    label(:InternalService)

    relate([
      {:specification, :SPECIFIES, :incoming},
      {:services, :MANAGES, :outgoing},
      {:resources, :USES, :outgoing}
    ])

    skip([:service_id, :parent_service_id])

    skip([:service_id, :resource_id])

    translate(id: :uuid)
  end

  actions do
    defaults([:read, :destroy, create: :*, update: :*])
  end

  attributes do
    uuid_primary_key(:id, writable?: true)
    attribute(:href, :string, public?: true)
    attribute(:name, :string, public?: true)
    attribute(:type, :atom, constraints: [one_of: [:service, :resource]], public?: true)
    attribute(:major_version, :integer, default: 1, public?: true)
    attribute(:minor_version, :integer, default: 0, public?: true)
  end
end
