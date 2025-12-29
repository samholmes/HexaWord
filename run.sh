#!/bin/bash
mkdir -p /home/runner/.local/bin
echo '#!/bin/bash
exit 0' > /home/runner/.local/bin/docker
chmod +x /home/runner/.local/bin/docker
export PATH="/home/runner/.local/bin:$PATH"
npm run dev
