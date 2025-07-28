const assert = require('assert');
const { extractModulesForTesting } = require('../../../../dist/src/parsers/configurationDriven/moduleParser');
const AshAuthConfig = require('../../../../dist/src/parsers/configurationDriven/AshAuthentication.config').default;

describe('AshAuthentication Multi-tier Parsing', () => {
  it('should correctly parse three-tier nested blocks', () => {
    // Test source with 3-tier nesting: authentication > strategies > password/magic_link
    const source = `
defmodule MyApp.User do
  use Ash.Resource
  use AshAuthentication

  authentication do
    strategies do
      password :default do
        hash_algorithm Bcrypt
        identity_field :email
      end
      
      magic_link :magic_link do
        sender MyApp.EmailSender
      end
    end
  end
end
    `;
    
    const matchedModules = [AshAuthConfig];
    const result = extractModulesForTesting(source, matchedModules);
    
    // Verify the structure
    assert.strictEqual(result.length, 1, 'Should find 1 top-level section (authentication)');
    
    const authSection = result[0];
    assert.strictEqual(authSection.section, 'authentication', 'Should find authentication section');
    
    // Find strategies blocks (second tier)
    const strategiesDetails = authSection.details.filter(d => d.detail === 'strategies');
    assert.strictEqual(strategiesDetails.length, 1, 'Should find 1 strategies block');
    
    // Find password and magic_link blocks (third tier)
    const passwordDetails = authSection.details.filter(d => d.detail === 'password');
    assert.strictEqual(passwordDetails.length, 1, 'Should find 1 password strategy');
    assert.strictEqual(passwordDetails[0].name, 'default', 'Password strategy name should be "default"');
    
    const magicLinkDetails = authSection.details.filter(d => d.detail === 'magic_link');
    assert.strictEqual(magicLinkDetails.length, 1, 'Should find 1 magic_link strategy');
    assert.strictEqual(magicLinkDetails[0].name, 'magic_link', 'Magic link strategy name should be "magic_link"');
    
    // Verify the raw content contains the implementation details
    assert.ok(passwordDetails[0].rawContent.includes('hash_algorithm'), 'Password details should contain implementation');
    assert.ok(magicLinkDetails[0].rawContent.includes('sender'), 'Magic link details should contain implementation');
  });
});
