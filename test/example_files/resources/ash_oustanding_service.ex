defmodule Service do
  use Ash.Resource,
    domain: Domain,
    data_layer: Ash.DataLayer.Ets,
    extensions: [AshOutstanding.Resource]

  outstanding do
    expect([:state, :status, :children])
  end

  actions do
    defaults([:destroy, create: :*])

    read :read do
      primary?(true)
    end

    update :update do
      primary?(true)
      require_atomic?(false)
      argument(:add_child, {:array, :uuid})

      change(manage_relationship(:add_child, :children, type: :append_and_remove))
    end
  end

  attributes do
    uuid_primary_key(:id, writable?: true)
    attribute(:name, :string, public?: true)
    attribute(:state, :atom, public?: true)
    attribute(:status, :atom, public?: true)
    attribute(:parent_id, :uuid, public?: true)
  end

  relationships do
    has_many(:children, Service, destination_attribute: :parent_id)
  end
end
