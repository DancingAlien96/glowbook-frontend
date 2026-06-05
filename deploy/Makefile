.PHONY: install bootstrap deploy backend frontend

# Install Ansible collections
install:
	ansible-galaxy collection install -r requirements.yml

# First-time server setup (run once)
bootstrap:
	ansible-playbook site.yml --tags bootstrap --ask-vault-pass --ask-pass

# Full deploy (backend + frontend)
deploy:
	ansible-playbook site.yml --ask-vault-pass

# Deploy backend only
backend:
	ansible-playbook site.yml --tags backend --ask-vault-pass

# Deploy frontend only
frontend:
	ansible-playbook site.yml --tags frontend --ask-vault-pass

# Create encrypted vault from example
vault-create:
	cp group_vars/vault.yml.example group_vars/vault.yml
	ansible-vault encrypt group_vars/vault.yml
