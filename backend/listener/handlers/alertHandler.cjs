module.exports = {
    handleAlertTriggered: async ({ alertId, alertType, productId, message, event }) => {
        // Logic: Create alert record, send push notification/email
        console.log(`[HANDLER] ⚠️ ALERT RECEIVED: ${message} (ID: ${alertId})`);

        // Example: Send notification
        // await notificationService.send({
        //   type: 'ALERT',
        //   payload: { alertId, message }
        // });
    }
};
