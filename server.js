const express = require('express');
const path = require('path');
const AWS = require('aws-sdk');

const app = express();

// Serve static files (for frontend)
app.use(express.static(path.join(__dirname)));

// Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve your login portal
});

// Check Load API
app.get('/checkLoad', async (req, res) => {
    try {
        // Replace with your Load Balancer ARN
        const lbArn = "arn:aws:elasticloadbalancing:ap-south-1:940482451244:loadbalancer/app/test-loadbalancer/f9606abce8fecc52";

        const elbv2 = new AWS.ELBv2({ region: 'ap-south-1' });
        const params = { LoadBalancerArns: [lbArn] };
        const data = await elbv2.describeTargetHealth(params).promise();

        const healthyInstances = data.TargetHealthDescriptions.filter(
            target => target.TargetHealth.State === "healthy"
        ).length;

        if (healthyInstances < 3) { // Example threshold
            return res.status(503).json({ message: "Too many users. Try again later!" });
        }
        res.json({ message: "Access allowed!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error checking load balancer health." });
    }
});

// Start Server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
