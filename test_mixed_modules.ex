defmodule MyApp.User do
  use Ash.Resource,
    data_layer: AshPostgres.DataLayer

  use AshAuthentication,
    strategies: [
      password: [
        identity_field: :email,
        hashed_password_field: :hashed_password
      ]
    ]

  postgres do
    table "users"
    repo MyApp.Repo
  end

  authentication do
    api MyApp.Api

    strategies do
      password :password do
        identity_field :email
        hashed_password_field :hashed_password
      end

      magic_link :magic_link do
        identity_field :email
        token_lifetime 10
      end
    end
  end

  attributes do
    uuid_primary_key :id
    attribute :email, :string
    attribute :hashed_password, :string, sensitive?: true
    attribute :first_name, :string
    attribute :last_name, :string
  end

  actions do
    defaults [:create, :read, :update, :destroy]

    read :by_email do
      argument :email, :string, allow_nil?: false
      filter expr(email == ^arg(:email))
    end

    create :register do
      argument :email, :string, allow_nil?: false
      argument :password, :string, allow_nil?: false
      argument :password_confirmation, :string, allow_nil?: false
      
      validate confirm(:password, :password_confirmation)
      change {AshAuthentication.AddOn.Confirmation, strategy_name: :password}
    end
  end

  calculations do
    calculate :full_name, :string, expr(first_name <> " " <> last_name)
  end

  aggregates do
    count :login_count, :user_tokens do
      filter expr(purpose == "session")
    end
  end

  relationships do
    has_many :user_tokens, MyApp.UserToken do
      destination_attribute :user_id
    end
  end

  validations do
    validate present([:email, :first_name, :last_name])
    validate match(:email, ~r/^[^\s]+@[^\s]+\.[^\s]+$/)
  end

  changes do
    change AshAuthentication.GenerateTokenChange
  end
end
